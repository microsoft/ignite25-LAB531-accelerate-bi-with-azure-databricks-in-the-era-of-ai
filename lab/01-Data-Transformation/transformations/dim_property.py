from pyspark import pipelines as dp
from pyspark.sql.functions import *

# Import common functions
from utilities.common_functions import *

# Helper views for enrichment data
@dp.view(name="property_amenities_agg")
def property_amenities_agg():
    return (
        spark.read.table(f"{source_catalog_schema}.property_amenities")
        .join(spark.read.table(f"{source_catalog_schema}.amenities"), ["amenity_id"])
        .groupBy("property_id")
        .agg(
            count("*").alias("total_amenities"),
            collect_list("name").alias("amenity_list"),
            sum(when(col("category") == "Luxury", 1).otherwise(0)).alias("luxury_amenity_count"),
            sum(when(col("category") == "Basic", 1).otherwise(0)).alias("basic_amenity_count")
        )
        .withColumn("amenity_tier",
            when(col("luxury_amenity_count") >= 3, "Luxury")
            .when(col("total_amenities") >= 8, "Standard")
            .otherwise("Basic"))
        .withColumn("has_wifi", array_contains(col("amenity_list"), "Wi-Fi"))
        .withColumn("has_kitchen", array_contains(col("amenity_list"), "Kitchen"))
        .withColumn("has_pool", array_contains(col("amenity_list"), "Pool"))
        .withColumn("has_parking", array_contains(col("amenity_list"), "Parking"))
        .withColumn("has_air_conditioning", array_contains(col("amenity_list"), "Air Conditioning"))
    )

@dp.view(name="property_images_agg")
def property_images_agg():
    return (
        spark.read.table(f"{source_catalog_schema}.property_images")
        .groupBy("property_id")
        .agg(
            count("*").alias("total_images"),
            max(when(col("is_primary") == True, col("url"))).alias("primary_image_url"),
            max("uploaded_at").alias("latest_image_upload_date")
        )
        .withColumn("has_professional_photos", col("total_images") >= 5)
    )

@dp.materialized_view(
    comment="Property dimension with amenities and images - refreshed materialized view",
    table_properties={
        "quality": "gold",
        "pipelines.autoOptimize.managed": "true"
    }
)
@dp.expect("unique_property", "property_id IS NOT NULL")
@dp.expect("valid_price", "base_price > 0")
@dp.expect("valid_bedrooms", "bedrooms >= 0")
def dim_property():
    destinations_current = spark.read.table(f"{source_catalog_schema}.destinations").alias("destinations")
    countries = spark.read.table(f"{source_catalog_schema}.countries").alias("countries")
    amenities_agg = spark.read.table("property_amenities_agg")
    images_agg = spark.read.table("property_images_agg")

    return (
        spark.read.table(f"{source_catalog_schema}.properties").alias("props")
        .join(broadcast(destinations_current), ["destination_id"])
        .join(broadcast(countries), col("destinations.country") == col("countries.country"), "left")
        .join(amenities_agg, ["property_id"], "left")
        .join(images_agg, ["property_id"], "left")
        .withColumn("property_sk", generate_sk("property_id", "PROP_"))
        .withColumn("region", get_region_udf(col("destinations.country")))
        .withColumn("price_tier",
            when(col("base_price") >= 500, "Premium")
            .when(col("base_price") >= 200, "Luxury") 
            .when(col("base_price") >= 100, "Mid-range")
            .otherwise("Budget"))
        .withColumn("size_category",
            when(col("bedrooms") >= 4, "Large")
            .when(col("bedrooms") >= 2, "Medium")
            .when(col("bedrooms") >= 1, "Small")
            .otherwise("Studio"))
        .withColumn("visual_appeal_score",
            when(col("has_professional_photos") == True, 4.0 + (col("total_images") * 0.1))
            .otherwise(2.0 + (coalesce(col("total_images"), lit(0)) * 0.2)))
        .select(
            # Core property info
            col("property_sk"), col("property_id"), col("host_id"), col("title").alias("property_title"),
            col("props.description").alias("property_description"), col("property_type"),
            col("base_price"), col("max_guests"), col("bedrooms"), col("bathrooms"),
            col("created_at").cast("date").alias("created_date"),

            # Geography
            col("destination_id"),
            col("destination").alias("city_name"), col("destinations.country").alias("country"), col("region"),
            col("state_or_province"), col("state_or_province_code"),
            col("countries.country_code").alias("destination_country_code"),
            col("countries.continent").alias("destination_continent"),
            col("props.property_latitude").alias("property_latitude"),
            col("props.property_longitude").alias("property_longitude"),
            
            # Amenities
            coalesce(col("total_amenities"), lit(0)).alias("total_amenities"),
            coalesce(col("has_wifi"), lit(False)).alias("has_wifi"),
            coalesce(col("has_kitchen"), lit(False)).alias("has_kitchen"),
            coalesce(col("has_pool"), lit(False)).alias("has_pool"),
            coalesce(col("has_parking"), lit(False)).alias("has_parking"),
            coalesce(col("has_air_conditioning"), lit(False)).alias("has_air_conditioning"),
            coalesce(col("amenity_tier"), lit("Basic")).alias("amenity_tier"),
            
            # Images
            col("primary_image_url"), 
            coalesce(col("total_images"), lit(0)).alias("total_images"),
            coalesce(col("has_professional_photos"), lit(False)).alias("has_professional_photos"),
            col("latest_image_upload_date"),
            
            # Classifications
            col("price_tier"), col("size_category"), 
            lit("Active").alias("property_status"),
            col("visual_appeal_score")
        )
    )